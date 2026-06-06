import { useEffect, useState } from "react";
import "./App.css";
import Dropdown from "./components/Dropdown";
import { type Pdf } from "./components/Dropdown";

type ChatBubble = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

function App() {
  const [userMsg, setUserMsg] = useState("");
  const [msgs, setMsgs] = useState<ChatBubble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
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
      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("data", data);
      setMsgs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get response";
      setErrorMsg(message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <div className="container">
          <div className="messages">
            {/* Chat Messages */}
            {msgs.map((item) => {
              return (
                <div
                  key={item.id}
                  className={item.role === "user" ? "user-msg" : "ai-msg"}
                >
                  <div>{item.content}</div>
                </div>
              );
            })}

            {/* Loader */}
            {isLoading && (
              <div className="loader-container">
                <div className="loader"></div>
                <p>AI is thinking...</p>
              </div>
            )}

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
