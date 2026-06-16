
import { useState, useRef } from 'react';
import { Paperclip, Upload, Trash2, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import { ATTACHMENT_CATEGORIES } from '@/types';
import { formatFileSize } from '@/utils/validator';

export default function StepAttachments() {
  const { currentApplication, addAttachment, removeAttachment } = useApplicationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState('');

  const attachments = currentApplication?.attachments || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadCategory) return;

    Array.from(files).forEach(file => {
      addAttachment({
        category: uploadCategory,
        fileName: file.name,
        fileSize: file.size,
        uploadTime: new Date().toLocaleString('zh-CN'),
        status: 'uploaded',
      });
    });

    setUploadCategory('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCategoryAttachments = (category: string) => {
    return attachments.filter(a => a.category === category);
  };

  const categoryInfo = ATTACHMENT_CATEGORIES.find(c => c.id === uploadCategory);

  const uploadedCount = ATTACHMENT_CATEGORIES.filter(cat => {
    const catAttachments = attachments.filter(a => a.category === cat.name);
    return catAttachments.length > 0;
  }).length;

  const requiredCount = ATTACHMENT_CATEGORIES.filter(c => c.required).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
          <Paperclip className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">附件材料</h2>
          <p className="text-sm text-gray-500">请按类别上传相关证明材料</p>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${
        uploadedCount >= requiredCount 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {uploadedCount >= requiredCount ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              已上传 {uploadedCount} / {requiredCount} 类必填材料
            </span>
          </div>
          <span className="text-xs text-gray-500">
            共 {attachments.length} 个文件
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {ATTACHMENT_CATEGORIES.map(category => {
          const catAttachments = getCategoryAttachments(category.name);
          const hasUpload = catAttachments.length > 0;

          return (
            <div 
              key={category.id}
              className={`border rounded-lg overflow-hidden ${
                hasUpload ? 'border-gray-200' : 'border-dashed border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${hasUpload ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  {category.required && (
                    <span className="text-xs text-red-500">必填</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {catAttachments.length} 个文件
                  </span>
                  <button
                    onClick={() => {
                      setUploadCategory(category.name);
                      fileInputRef.current?.click();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    上传
                  </button>
                </div>
              </div>

              {catAttachments.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {catAttachments.map(att => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{att.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(att.fileSize)} · {att.uploadTime}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-400">暂无上传文件</p>
                  <p className="text-xs text-gray-400 mt-1">点击右上角上传按钮添加</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">上传提示</p>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• 支持 PDF、JPG、PNG、Word 等格式，单个文件不超过 10MB</li>
            <li>• 必填项材料必须上传，否则无法提交申报</li>
            <li>• 身份证明材料包括法人身份证、负责人身份证等</li>
            <li>• 资质证明材料包括医师资格证、护士资格证等</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
