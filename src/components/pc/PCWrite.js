import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, Video } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { compressImage } from "@/lib/imageUtils";

export default function PCWrite({ editId }) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(editId ? true : false);
  const quillRef = useRef(null);

  const [isAdminOrHospital, setIsAdminOrHospital] = useState(false);

  useEffect(() => {
    if (editId) {
      fetch(`/api/posts/detail?id=${editId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.post) {
            setCategory(data.post.category);
            setTitle(data.post.title);
            setContent(data.post.content);
          }
        })
        .finally(() => setIsLoading(false));
    }

    // 사용자 권한 확인하여 전문가칼럼 노출 여부 결정
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.role === 'admin' || user.role === 'hospital') {
          setIsAdminOrHospital(true);
        }
      } catch (e) {}
    }
  }, [editId]);

  const categories = isAdminOrHospital 
    ? ["탈모수다", "리얼후기", "탈모정보", "전문가칼럼"] 
    : ["탈모수다", "리얼후기", "탈모정보"];

  // Custom Image Handler for Quill
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const compressedBase64 = await compressImage(file, 800, 0.6);
          
          // Convert base64 back to Blob
          const res = await fetch(compressedBase64);
          const blob = await res.blob();
          
          // Upload to R2 via API
          const formData = new FormData();
          formData.append("image", blob, file.name || "image.jpg");
          
          const uploadRes = await fetch("/api/posts/upload-image", {
            method: "POST",
            body: formData,
          });
          
          if (!uploadRes.ok) {
            throw new Error("이미지 업로드에 실패했습니다.");
          }
          
          const uploadData = await uploadRes.json();
          if (!uploadData.success) {
            throw new Error(uploadData.error || "이미지 업로드에 실패했습니다.");
          }

          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          // Insert returned URL instead of base64
          quill.insertEmbed(range.index, "image", uploadData.url);
          quill.setSelection(range.index + 1);
        } catch (err) {
          console.error("Image upload failed:", err);
          alert("이미지 처리 중 오류가 발생했습니다.");
        }
      }
    };
  };

  const handlePasteAndDrop = async (e) => {
    let items;
    if (e.type === 'paste') {
      items = e.clipboardData?.items;
    } else if (e.type === 'drop') {
      items = e.dataTransfer?.items;
    }
    
    if (!items) return;

    const imageFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        imageFiles.push(items[i].getAsFile());
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault(); // Prevent default base64 injection
      
      for (const file of imageFiles) {
        if (!file) continue;
        try {
          const compressedBase64 = await compressImage(file, 800, 0.6);
          const res = await fetch(compressedBase64);
          const blob = await res.blob();
          
          const formData = new FormData();
          formData.append("image", blob, file.name || "image.jpg");
          
          const uploadRes = await fetch("/api/posts/upload-image", {
            method: "POST",
            body: formData,
          });
          
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            if (uploadData.success) {
              const quill = quillRef.current.getEditor();
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "image", uploadData.url);
              quill.setSelection(range.index + 1);
            }
          }
        } catch (err) {
          console.error("Paste/Drop Image upload failed:", err);
        }
      }
    }
  };

  const handleCustomImage = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const compressedBase64 = await compressImage(file, 800, 0.6);
          const res = await fetch(compressedBase64);
          const blob = await res.blob();
          
          const formData = new FormData();
          formData.append("image", blob, file.name || "image.jpg");
          
          const uploadRes = await fetch("/api/posts/upload-image", {
            method: "POST",
            body: formData,
          });
          
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            if (data.success) {
              const quill = quillRef.current.getEditor();
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "image", data.url);
              quill.setSelection(range.index + 1);
            }
          }
        } catch (err) {
          alert("이미지 업로드에 실패했습니다.");
        }
      }
    };
  };

  const handleCustomVideo = () => {
    const url = prompt("유튜브 동영상 링크를 입력하세요:");
    if (url) {
      // Basic check for youtube url
      let embedUrl = url;
      if (url.includes("watch?v=")) {
        embedUrl = url.replace("watch?v=", "embed/");
      } else if (url.includes("youtu.be/")) {
        embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
      }

      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "video", embedUrl);
      quill.setSelection(range.index + 1);
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: "#quill-external-toolbar",
      },
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "color",
    "background",
    "align",
    "list",
    "bullet",
    "link",
    "image",
    "video",
  ];

  const handlePost = async () => {
    if (!category || !title.trim() || !content.trim() || content === "<p><br></p>") return;
    
    try {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }
      const user = JSON.parse(savedUser);

      const endpoint = editId ? '/api/posts/update' : '/api/posts/create';
      const bodyData = {
        userId: user.id,
        category,
        title,
        content
      };
      
      if (editId) {
        bodyData.postId = editId;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (res.ok) {
        if (data.rewarded) {
          alert("🎉 게시글 작성 보상으로 분석 티켓 1개가 지급되었습니다!\n\n(글 작성 보상은 1일 최대 1개, 주 최대 3개까지만 지급됩니다.)");
        } else {
          alert(editId ? "게시글이 성공적으로 수정되었습니다." : "게시글이 성공적으로 등록되었습니다.");
        }
        if (editId) {
          router.push(`/community/detail?id=${editId}`);
        } else {
          router.push("/community");
        }
      } else {
        alert(data.error || "게시글 등록에 실패했습니다.");
      }
    } catch (e) {
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const isFormValid = category && title.trim() && content.trim() && content !== "<p><br></p>" && !isLoading;

  return (
    <div className="flex flex-col w-full bg-gray-50 pb-20 items-center pt-8">
      
      {/* ===== 상단 통짜 고정 래퍼 (글로벌 GNB 136px 아래에 찰싹 붙음) ===== */}
      {/* '하나의 문서' 처럼 보이기 위해 넓이를 800px로 통일하고 상단 둥글기 적용 */}
      <div className="sticky top-[136px] z-40 w-full max-w-[800px] flex flex-col bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0">
        
        {/* 1. PCWrite 헤더 (새 글 작성 / 등록 버튼) */}
        <header className="w-full h-16 flex items-center justify-between px-6 bg-white rounded-t-xl border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
            <span className="font-bold text-xl text-gray-900">{editId ? '글 수정' : '새 글 작성'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-[15px]"
            >
              취소
            </button>
            <button 
              onClick={handlePost}
              disabled={!isFormValid}
              className={`px-6 py-2 font-bold rounded-lg transition-all text-[15px] shadow-sm ${
                isFormValid 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              등록
            </button>
          </div>
        </header>

        {/* 2. 카테고리 선택 */}
        <div className="px-6 py-4 flex items-center gap-6">
          <label className="text-[15px] font-bold text-gray-700 shrink-0">카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-5 py-2 rounded-md text-[14px] font-bold transition-colors border ${
                  category === cat 
                    ? 'bg-teal-600 border-teal-600 text-white shadow-sm' 
                    : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. 커스텀 버튼부 (사진/유튜브) */}
        <div className="flex gap-6 px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={handleCustomImage}
            className="flex flex-col items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors"
          >
            <ImageIcon className="w-8 h-8" />
            <span className="text-[12px] font-bold">사진 첨부</span>
          </button>
          <button 
            onClick={handleCustomVideo}
            className="flex flex-col items-center gap-2 text-gray-500 hover:text-teal-600 transition-colors"
          >
            <Video className="w-8 h-8" />
            <span className="text-[12px] font-bold">유튜브 삽입</span>
          </button>
        </div>

        {/* 4. ReactQuill 외부 툴바 DOM */}
        <div id="quill-external-toolbar" className="px-4 py-2 bg-white flex items-center flex-wrap gap-1 border-t border-gray-100 border-b border-gray-200">
          <select className="ql-header" defaultValue="false">
            <option value="1">제목 1</option>
            <option value="2">제목 2</option>
            <option value="3">제목 3</option>
            <option value="false">본문</option>
          </select>
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
          <button className="ql-blockquote" />
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <select className="ql-color" />
          <select className="ql-background" />
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <button className="ql-align" value="" />
          <button className="ql-align" value="center" />
          <button className="ql-align" value="right" />
          <div className="w-px h-5 bg-gray-300 mx-2"></div>
          <button className="ql-link" />
          <button className="ql-clean" />
        </div>
      </div>

      {/* ===== 하단 본문 (스크롤 시 자연스럽게 올라가는 부분) ===== */}
      <main className="w-full max-w-[800px] bg-white rounded-b-xl border border-gray-200 border-t-0 shadow-sm flex flex-col quill-pc-container relative">
        
        <style jsx global>{`
          /* 자연스러운 윈도우 스크롤을 위해 에디터 자체 높이를 유동적으로 */
          .quill-pc-container {
            min-height: 500px;
          }
          .quill-pc-container .quill {
            display: flex;
            flex-direction: column;
            border: none;
          }
          .quill-pc-container .ql-container.ql-snow {
            border: none;
            font-family: inherit;
          }
          /* 툴바 보더 제거 */
          #quill-external-toolbar.ql-toolbar.ql-snow {
            border: none;
          }
          .quill-pc-container .ql-editor {
            padding: 24px 32px 32px 32px;
            font-size: 16px;
            line-height: 1.8;
            color: #374151;
            min-height: 500px;
          }
          .quill-pc-container .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
            left: 32px;
          }
          .quill-pc-container .ql-editor img {
            border-radius: 8px;
            margin: 16px 0;
            max-width: 100%;
          }
          .quill-pc-container .ql-editor h1, 
          .quill-pc-container .ql-editor h2 {
            margin-top: 24px;
            margin-bottom: 12px;
            color: #111827;
          }
          .quill-pc-container .ql-editor p {
            margin-bottom: 8px;
          }
          .quill-pc-container .ql-snow .ql-picker-label {
            font-weight: 500;
            color: #4b5563;
          }
          /* 툴팁 위치 조정 */
          #quill-external-toolbar .ql-tooltip {
            left: 50% !important;
            transform: translateX(-50%);
            top: 100% !important;
            position: absolute !important;
            z-index: 100;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
        `}</style>
        
        {/* 제목 입력칸 */}
        <div className="px-8 pt-8 pb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full text-[32px] font-bold text-gray-900 placeholder-gray-300 focus:outline-none py-2"
          />
        </div>

        {/* 구분 회색 줄 */}
        <div className="w-[calc(100%-64px)] mx-auto h-[1px] bg-gray-200 my-2"></div>

        {/* 내용 에디터 (onPasteCapture 등 바인딩) */}
        <div 
          className="flex-1"
          onPasteCapture={handlePasteAndDrop}
          onDropCapture={handlePasteAndDrop}
        >
          <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="내용을 자유롭게 작성해주세요. 이미지와 동영상도 첨부할 수 있습니다."
            />
          </div>
      </main>
    </div>
  );
}
