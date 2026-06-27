"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Image as ImageIcon, X } from "lucide-react";

export default function WritePage() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const categories = ["탈모수다", "리얼후기", "탈모정보"];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Focus editor if not active to ensure we have a selection
    if (document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }

    files.forEach(file => {
      const url = URL.createObjectURL(file);
      // Use negative margin to break out of the px-5 container and be full-width
      const imgHtml = `<img src="${url}" style="width: calc(100% + 40px); max-width: none; margin-left: -20px; margin-top: 16px; margin-bottom: 16px; display: block;" alt="uploaded" /><p><br></p>`;
      document.execCommand("insertHTML", false, imgHtml);
    });

    setContent(editorRef.current.innerHTML);
    e.target.value = ''; // Reset input
  };

  const handlePost = () => {
    if (!category || !title.trim() || !content.trim()) return;
    // TODO: Implement actual post submission logic
    console.log("Post submitted:", { category, title, content });
    router.back();
  };

  const isFormValid = category && title.trim() && content.trim();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-gray-900">글쓰기</h1>
        <button 
          onClick={handlePost}
          disabled={!isFormValid}
          className={`font-bold text-[15px] ${isFormValid ? 'text-teal-600' : 'text-gray-300'}`}
        >
          등록
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col flex-1 pb-20">
        {/* Category Selection */}
        <div className="px-5 py-4 border-b border-gray-100">
          <label className="block text-sm font-bold text-gray-800 mb-3">카테고리</label>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  category === cat 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div className="px-5 py-4 border-b border-gray-100">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full text-lg font-bold text-gray-900 placeholder-gray-300 focus:outline-none"
          />
        </div>

        {/* Content Input (Rich Text) */}
        <div className="flex-1 flex flex-col relative px-5 py-4">
          {!content && (
            <div className="absolute top-4 left-5 text-gray-300 pointer-events-none text-[15px]">
              커뮤니티 가이드라인에 맞는 따뜻한 글을 남겨주세요.
            </div>
          )}
          <div 
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="w-full flex-1 text-[15px] text-gray-800 focus:outline-none min-h-[300px] leading-relaxed"
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
          ></div>
        </div>
      </main>

      {/* Sticky Bottom Bar for Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center max-w-md mx-auto z-50 pb-safe">
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-teal-600 transition-colors"
        >
          <ImageIcon className="w-6 h-6" />
          <span className="text-sm font-medium">사진 첨부</span>
        </button>
      </div>
    </div>
  );
}
