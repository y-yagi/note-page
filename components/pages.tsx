import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCollection, deleteDocument } from "@nandorojo/swr-firestore";
import Page from "../types/page";
import Notebook from "../types/notebook";
import { useUser } from "../lib/useUser";
import MarkdownRenderer from "./markdown-renderer";

interface NoteBookOption {
  key: string;
  value: string;
  text: string;
}

const Pages = () => {
  const { user } = useUser();
  const notebookCollection = `notebooks-renew/${user?.id}/notebooks/`;
  const router = useRouter();
  const [noteBookPath, setNoteBookPath] = useState(() => {
    return (
      router.query["book"] ||
      window?.sessionStorage?.getItem("book") ||
      "default"
    );
  });
  const [tabActiveIndex, setTabActiveIndex] = useState(0);

  const { data, error } = useCollection<Page>(
    `${notebookCollection}${noteBookPath}/pages`,
    {
      orderBy: ["updatedAt", "desc"],
    },
  );

  const { data: notebooks } = useCollection<Notebook>(notebookCollection, {});

  if (error) {
    console.error(error);
    return <p>Error: {JSON.stringify(error)}</p>;
  }
  if (!data) return <p>Loading...</p>;

  function noteBooksOptions(): NoteBookOption[] {
    let options: NoteBookOption[] = [];
    if (!notebooks) return options;

    notebooks.forEach((book) => {
      options.push({
        key: book.id,
        value: book.id,
        text: book.id,
      });
    });
    options.push({
      key: "create_new_note_book",
      value: "create_new_note_book",
      text: "Create a new note book",
    });

    return options;
  }

  function onSelectChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    if (event.target.value === "create_new_note_book") {
      router.push("/notebooks/new");
      return;
    }
    setNoteBookPath(event.target.value);
  }

  function destroyNotebook(data: Page[]) {
    if (noteBookPath === "default" || data.length !== 0) return null;

    return (
      <button
        type="button"
        className="btn btn-red float-right"
        onClick={() => {
          if (window.confirm("Are you sure you wish to delete this notebook?"))
            deleteDocument(`${notebookCollection}${noteBookPath}`);
          setNoteBookPath("default");
        }}
      >
        Destroy a note book
      </button>
    );
  }

  return (
    <>
      <div className="text-center text-gray-600 my-4">
        <select
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          onChange={onSelectChange}
          value={noteBookPath as string}
        >
          {noteBooksOptions().map((option) => (
            <option key={option.key} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </div>
      <div className="my-4" />
      <Link href={`/pages/new?book=${noteBookPath}`} passHref>
        <a className="btn btn-blue inline-block">Create a new page</a>
      </Link>
      <div className="border border-gray-300 rounded p-4 my-4">
        <div className="border-b border-gray-300">
          <div className="Tab-wrapped">
            {data.map((page, index) => (
              <button
                key={page.id}
                className={`px-4 py-2 border-b-2 ${
                  tabActiveIndex === index
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => setTabActiveIndex(index)}
              >
                {page.name}
              </button>
            ))}
          </div>
        </div>
        <div className="Tab-body p-4">
          {data[tabActiveIndex] && (
            <>
              <button
                type="button"
                className="btn btn-red float-right ml-2"
                onClick={() => {
                  if (
                    window.confirm("Are you sure you wish to delete this page?")
                  )
                    deleteDocument(
                      `${notebookCollection}${noteBookPath}/pages/${data[tabActiveIndex].id}`,
                    );
                }}
              >
                Destroy
              </button>
              <Link
                href={{
                  pathname: `/pages/${data[tabActiveIndex].id}`,
                  query: { book: noteBookPath },
                }}
                passHref
              >
                <a className="btn btn-blue float-right text-sm">Edit</a>
              </Link>
              <MarkdownRenderer content={data[tabActiveIndex].content} />
            </>
          )}
        </div>
      </div>
      {destroyNotebook(data)}
    </>
  );
};

export default Pages;
