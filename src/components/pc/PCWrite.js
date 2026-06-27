import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function PCWrite() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const quillRef = useRef(null);

  const categories = ["탈모수다", "리얼후기", "탈모정보"];

  // Custom Image Handler for Quill
  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        // In a real app, you would upload this to your server/S3/R2 and get a URL.
        // For now, we'll use a local object URL to demonstrate the WYSIWYG feature.
        const url = URL.createObjectURL(file);
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", url);
        quill.setSelection(range.index + 1);
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

  const handlePost = () => {
    if (!category || !title.trim() || !content.trim() || content === "<p><br></p>") return;
    // TODO: Implement actual post submission logic to backend API
    console.log("Post submitted:", { category, title, content });
    router.push("/community");
  };

  const isFormValid = category && title.trim() && content.trim() && content !== "<p><br></p>";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm flex justify-center">
        <div className="w-full max-w-[1080px] h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
            <span className="font-bold text-xl text-gray-900">새 글 작성</span>
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col items-center flex-1 w-full bg-gray-50/30 py-8">
        <div className="w-full max-w-[800px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-[800px] overflow-hidden">
          
          {/* Category & Title Section */}
          <div className="p-8 border-b border-gray-100 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-700">카테고리</label>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-[14px] font-bold transition-colors border ${
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
                placeholder="제목을 입력하세요"
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
              placeholder="내용을 자유롭게 작성해주세요. 이미지와 동영상도 첨부할 수 있습니다."
            />
          </div>
        </div>
      </main>
    </div>
  );
}
