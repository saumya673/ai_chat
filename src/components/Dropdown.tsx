export type Pdf = {
  pdf_id: number | "";
  pdf_name: string;
  pdf_text: string;
  status: string;
};

type DropdownProps = {
  pdfId: number | "";
  setPdfId: React.Dispatch<React.SetStateAction<number | "">>;
  pdfList: Pdf[];
};

const Dropdown = ({ pdfId, setPdfId, pdfList }: DropdownProps) => {
  return (
    <div>
      <select
        name="pdf"
        id="pdf"
        value={pdfId}
        onChange={(e) => setPdfId(Number(e.target.value))}
      >
        <option value="" disabled>
          List of pdfs
        </option>
        {pdfList.map((item) => {
          return (
            <option key={item.pdf_id} value={item.pdf_id}>
              {item.pdf_name}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Dropdown;
