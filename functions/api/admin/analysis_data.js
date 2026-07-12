export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'DB 연결 설정이 누락되었습니다.' }), { status: 500 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), { status: 401 });
    }

    const userRole = await db.prepare('SELECT role FROM users WHERE id = ?').bind(userId).first();
    if (!userRole || userRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: '관리자 권한이 필요합니다.' }), { status: 403 });
    }

    const period = url.searchParams.get('period') || 'daily';

    // 1. 누적 전체 요약 데이터 (Summary)
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) as today_count,
        SUM(CASE WHEN json_extract(details, '$.scanType') = '이마' THEN 1 ELSE 0 END) as forehead_count,
        SUM(CASE WHEN json_extract(details, '$.scanType') = '정수리' THEN 1 ELSE 0 END) as crown_count,
        SUM(CASE WHEN json_extract(details, '$.patientInfo.gender') = '남성' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN json_extract(details, '$.patientInfo.gender') = '여성' THEN 1 ELSE 0 END) as female_count
      FROM diagnostics
    `;
    const summaryResult = await db.prepare(summaryQuery).first();

    // 2. 남녀 누적 상세 데이터 (Breakdown)
    const breakdownQuery = `
      SELECT 
        json_extract(details, '$.patientInfo.gender') as gender,
        json_extract(details, '$.scanType') as scanType,
        json_extract(details, '$.summary.asiStage') as asiStage,
        COUNT(*) as count
      FROM diagnostics
      GROUP BY gender, scanType, asiStage
    `;
    const { results: breakdownResults } = await db.prepare(breakdownQuery).all();

    const breakdown = {
      male: { total: 0, forehead: 0, crown: 0, stages: { "ASI-M1":0, "ASI-M2":0, "ASI-M3":0, "ASI-M4":0, "ASI-M5":0, "ASI-M6":0, "ASI-M7":0 } },
      female: { total: 0, forehead: 0, crown: 0, stages: { "ASI-F1":0, "ASI-F2":0, "ASI-F3":0, "ASI-F4":0, "ASI-F5":0 } }
    };

    breakdownResults.forEach(row => {
      const g = row.gender === '여성' ? 'female' : (row.gender === '남성' ? 'male' : null);
      if (!g) return;
      
      const count = row.count || 0;
      breakdown[g].total += count;
      
      if (row.scanType === '이마') breakdown[g].forehead += count;
      else if (row.scanType === '정수리') breakdown[g].crown += count;

      if (row.asiStage && breakdown[g].stages[row.asiStage] !== undefined) {
        breakdown[g].stages[row.asiStage] += count;
      }
    });

    // 3. 차트 데이터 (Chart)
    let timeModifier, groupByFormat;
    if (period === 'monthly') {
      timeModifier = "'-12 months'";
      groupByFormat = "%Y-%m";
    } else if (period === 'weekly') {
      timeModifier = "'-84 days'";
      groupByFormat = "%Y-%W";
    } else {
      timeModifier = "'-30 days'";
      groupByFormat = "%Y-%m-%d";
    }

    const chartQuery = `
      SELECT 
        strftime('${groupByFormat}', created_at) as date_group,
        COUNT(*) as total_count
      FROM diagnostics
      WHERE created_at >= datetime('now', ${timeModifier})
      GROUP BY date_group
      ORDER BY date_group ASC
    `;
    
    const { results: chartResults } = await db.prepare(chartQuery).all();

    // Helper formatting for labels
    const formatLabel = (dateStr) => {
      if (period === 'monthly') {
        const [y, m] = dateStr.split('-');
        return `${y.substring(2)}년 ${m}월`;
      } else if (period === 'weekly') {
        const [y, w] = dateStr.split('-');
        return `${y.substring(2)}년 ${w}주차`;
      } else {
        const [y, m, d] = dateStr.split('-');
        return `${m}.${d}`;
      }
    };

    const formattedChartData = chartResults.map(r => ({
      date: formatLabel(r.date_group),
      분석건수: r.total_count
    }));

    return new Response(JSON.stringify({
      success: true,
      summary: summaryResult,
      breakdown,
      chartData: formattedChartData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: '서버 에러가 발생했습니다.', details: err.message }), { status: 500 });
  }
}
