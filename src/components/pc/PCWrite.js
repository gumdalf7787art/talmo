import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon } from "lucide-react";
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
  }, [editId]);

  const categories = ["?덈え?섎떎", "由ъ뼹?꾧린", "?덈え?뺣낫"];

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
            throw new Error("?대?吏 ?낅줈?쒖뿉 ?ㅽ뙣?덉뒿?덈떎.");
          }
          
          const uploadData = await uploadRes.json();
          if (!uploadData.success) {
            throw new Error(uploadData.error || "?대?吏 ?낅줈?쒖뿉 ?ㅽ뙣?덉뒿?덈떎.");
          }

          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          // Insert returned URL instead of base64
          quill.insertEmbed(range.index, "image", uploadData.url);
          quill.setSelection(range.index + 1);
        } catch (err) {
          console.error("Image upload failed:", err);
          alert("?대?吏 泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.");
        }
      }
    };
  };

  // Memoize modules to prevent Quill from re-rendering and losing focus
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
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
        alert("濡쒓렇?몄씠 ?꾩슂?⑸땲??");
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
        alert(editId ? "寃뚯떆湲???깃났?곸쑝濡??섏젙?섏뿀?듬땲??" : "寃뚯떆湲???깃났?곸쑝濡??깅줉?섏뿀?듬땲??");
        if (editId) {
          router.push(`/community/detail?id=${editId}`);
        } else {
          router.push("/community");
        }
      } else {
        alert(data.error || "寃뚯떆湲 ?깅줉???ㅽ뙣?덉뒿?덈떎.");
      }
    } catch (e) {
      alert("?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?ㅼ떆 ?쒕룄?댁＜?몄슂.");
    }
  };

  const isFormValid = category && title.trim() && content.trim() && content !== "<p><br></p>" && !isLoading;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm flex justify-center">
        <div className="w-full max-w-[1080px] h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
            <span className="font-bold text-xl text-gray-900">{editId ? '湲 ?섏젙' : '??湲 ?묒꽦'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-[15px]"
            >
              痍⑥냼
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
              ?깅줉
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col items-center flex-1 w-full bg-gray-50/30 py-8">
        <div className="w-full max-w-[800px] bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col min-h-[800px] overflow-hidden">
          
          {/* Category & Title Section */}
          <div className="p-8 border-b border-gray-100 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-700">移댄뀒怨좊━</label>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-md text-[14px] font-bold transition-colors border ${
                      category === cat 
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col mt-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="?쒕ぉ???낅젰?섏꽭??
                className="w-full text-[32px] font-bold text-gray-900 placeholder-gray-300 focus:outline-none py-2"
              />
            </div>
          </div>

          {/* Quill Editor wrapper */}
          <div className="flex-1 flex flex-col relative quill-pc-container">
            <style jsx global>{`
              /* Customizing React Quill to look like a modern blog editor */
              .quill-pc-container .quill {
                display: flex;
                flex-direction: column;
                height: 100%;
                min-height: 500px;
              }
              .quill-pc-container .ql-toolbar.ql-snow {
                border: none;
                border-bottom: 1px solid #f3f4f6;
                padding: 12px 32px;
                background-color: #ffffff;
                position: sticky;
                top: 64px; /* Header height */
                z-index: 40;
              }
              .quill-pc-container .ql-container.ql-snow {
                border: none;
                flex: 1;
                font-family: inherit;
              }
              .quill-pc-container .ql-editor {
                padding: 32px;
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
            `}</style>
            
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="?댁슜???먯쑀濡?쾶 ?묒꽦?댁＜?몄슂. ?대?吏? ?숈쁺?곷룄 泥⑤??????덉뒿?덈떎."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

