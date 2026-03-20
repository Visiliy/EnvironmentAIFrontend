import "../UX/Chat.css";
import { useRef, useEffect, useCallback, useState } from "react";

const Chat = ({ placeholder, onSendMessage, currentChatId }) => {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [message, setMessage] = useState("");

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [adjustHeight]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        setTimeout(adjustHeight, 0);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const allowedTypes = ['.txt', '.docx', '.pdf'];
        
        const validFiles = selectedFiles.filter(file => {
            const fileType = file.type || `.${file.name.split('.').pop()}`;
            return allowedTypes.some(type => fileType.includes(type) || file.name.endsWith(type));
        });

        const newFiles = [...files];
        validFiles.forEach(file => {
            const exists = files.some(f => f.name === file.name && f.size === file.size);
            if (!exists && newFiles.length < 10) {
                newFiles.push(file);
            }
        });
        
        setFiles(newFiles.slice(0, 10));
        
        fileInputRef.current.value = '';
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const truncateFileName = (fileName) => {
        const lastDotIndex = fileName.lastIndexOf('.');
        const name = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
        const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
        
        if (name.length > 20) {
            return name.substring(0, 20) + '...' + extension;
        }
        return fileName;
    };

    const handleSend = () => {
        if (message.trim() || files.length > 0) {
            onSendMessage(message, files, currentChatId);
            setMessage("");
            setFiles([]);
            if (textareaRef.current) {
                textareaRef.current.value = "";
                adjustHeight();
            }
        }
    };

    return (
        <div className="chat-wrapper">
            <textarea 
                ref={textareaRef}
                placeholder={placeholder}
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onInput={adjustHeight}
                onKeyDown={handleKeyDown}
            />
            <div className="options-btn">
                <button className="options" onClick={() => fileInputRef.current.click()}>+</button>
                <button className="send" onClick={handleSend}>↑</button>
            </div>
            <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                onChange={handleFileSelect}
                accept=".txt,.doc,.docx,.pdf"
            />
            {files.length > 0 && (
                <div className="files-container">
                    {files.map((file, index) => (
                        <div key={index} className="file-chip" onClick={() => removeFile(index)}>
                            <span className="file-name">{truncateFileName(file.name)}</span>
                            <span className="file-remove">×</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Chat;