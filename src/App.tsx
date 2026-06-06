import { memo, useEffect, useState } from "react";
import "./App.css";
import Dropdown from "./components/Dropdown";
import { type Pdf } from "./components/Dropdown";

type ChatBubble = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const MessageBubble = memo(function MessageBubble({ role, content }: ChatBubble) {
  return (
    <div className={role === "user" ? "user-msg" : "ai-msg"}>
      <div>{content}</div>
    </div>
  );
});

function App() {
  const [userMsg, setUserMsg] = useState("");
  const [msgs, setMsgs] = useState<ChatBubble[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [pdfId, setPdfId] = useState<number | "">("");
  const [pdfList, setPdfList] = useState<Pdf[]>([]);

  useEffect(() => {
    const handleDropdown = async () => {
      const response = await fetch("http://127.0.0.1:8000/pdfs");
      const pdfs = await response.json();
      setPdfList(pdfs.pdf_data);
    };

    handleDropdown();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMsg(e.target.value);
    setErrorMsg("");
  };

  const url =
    pdfId !== ""
      ? `http://127.0.0.1:8000/chat?pdf_id=${pdfId}`
      : "http://127.0.0.1:8000/chat";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userMsg.trim()) return;
    setMsgs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: userMsg,
      },
    ]);
    setErrorMsg("");

    try {
      const msg = userMsg;
      setUserMsg("");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          role: "user",
          content: msg,
        }),
      });
      const assistantId = crypto.randomUUID();

      setMsgs((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
        },
      ]);

      if (!res.body) {
        throw new Error("Response body is empty");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMsgs((prev) =>
          prev.map((item) =>
            item.id === assistantId
              ? { ...item, content: item.content + chunk }
              : item,
          ),
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get response";
      setErrorMsg(message);
      console.log(error);
    }
  };

  return (
    <>
      <div>
        <div className="container">
          <div className="messages">
            {/* Chat Messages */}
            {msgs.map((item) => (
              <MessageBubble
                key={item.id}
                id={item.id}
                role={item.role}
                content={item.content}
              />
            ))}

            {/* Error Message */}
            {errorMsg && (
              <div className="error-message">
                <p>{errorMsg}</p>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="chat-input">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Ask something"
                value={userMsg}
                onChange={handleChange}
              />
              <Dropdown pdfList={pdfList} pdfId={pdfId} setPdfId={setPdfId} />
              <button className="input-button" type="submit">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
