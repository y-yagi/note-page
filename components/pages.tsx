import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR, { mutate } from "swr";
import { SemanticToastContainer } from "react-semantic-toasts";
import "react-semantic-toasts/styles/react-semantic-alert.css";
import {
  deleteNotebook,
  deletePage,
  fetchNotebooks,
  fetchPages,
  notebooksPath,
  pagesPath,
  showApiError,
} from "../lib/api";
import Page from "../types/page";
import Notebook from "../types/notebook";
import { useUser } from "../lib/useUser";
import MarkdownRenderer from "./markdown-renderer";
import {
  Divider,
  Header,
  Button,
  Segment,
  Select,
  Tab,
  TabProps,
} from "semantic-ui-react";

interface NoteBookOption {
  key: string;
  value: string;
  text: string;
}

const Pages = () => {
  const { user } = useUser();
  const router = useRouter();
  const [noteBookPath, setNoteBookPath] = useState(() => {
    return (
      router.query["book"] ||
      window?.sessionStorage?.getItem("book") ||
      "default"
    );
  });
  const [tabActiveIndex, setTabActiveIndex] = useState(0);

  const book = noteBookPath as string;

  // The notebooks request creates the "default" notebook on first use, so the
  // pages request waits for it.
  const { data: notebooks, error: notebooksError } = useSWR<Notebook[]>(
    user ? notebooksPath : null,
    fetchNotebooks,
  );

  const { data, error: pagesError } = useSWR<Page[]>(
    user && notebooks ? pagesPath(book) : null,
    fetchPages,
  );

  const error = notebooksError || pagesError;

  if (error) {
    console.error(error);
    return <p>Error: {error.message}</p>;
  }
  if (!data) return <p>Loading...</p>;

  function noteBooksOptions(): NoteBookOption[] {
    let options: NoteBookOption[] = [];
    if (!notebooks) return options;

    notebooks.forEach((book) => {
      options.push({
        key: book.name,
        value: book.name,
        text: book.name,
      });
    });
    options.push({
      key: "create_new_note_book",
      value: "create_new_note_book",
      text: "Create a new note book",
    });

    return options;
  }

  function panes(data: Page[]) {
    let panes: any[] = [];

    data.forEach((page) =>
      panes.push({
        menuItem: page.name,
        render: () => (
          <Tab.Pane className="Tab-body">
            <Button
              type="submit"
              floated="right"
              color="red"
              size="mini"
              onClick={() => {
                if (
                  window.confirm("Are you sure you wish to delete this page?")
                )
                  deletePage(book, page.id)
                    .then(() => mutate(pagesPath(book)))
                    .catch(showApiError);
              }}
            >
              Destroy
            </Button>
            <Link
              href={`/pages/${page.id}?book=${encodeURIComponent(book)}`}
              passHref
            >
              <Button type="submit" floated="right" color="blue" size="mini">
                Edit
              </Button>
            </Link>
            <MarkdownRenderer content={page.content} />
          </Tab.Pane>
        ),
      }),
    );

    return panes;
  }

  function handleTabChange(data: TabProps) {
    setTabActiveIndex(data.activeIndex as number);
  }

  function onSelectChange(_event: any, data: any): void {
    if (data.value === "create_new_note_book") {
      router.push("/notebooks/new");
      return;
    }
    setNoteBookPath(data.value);
  }

  function destroyNotebook(data: Page[]) {
    if (noteBookPath === "default" || data.length !== 0) return "";

    return (
      <Button
        type="submit"
        floated="right"
        color="red"
        onClick={() => {
          if (!window.confirm("Are you sure you wish to delete this notebook?"))
            return;
          deleteNotebook(book)
            .then(() => {
              setNoteBookPath("default");
              return mutate(notebooksPath);
            })
            .catch(showApiError);
        }}
      >
        Destroy a note book
      </Button>
    );
  }

  return (
    <>
      <SemanticToastContainer />
      <Header as="h3" icon textAlign="center" color="grey">
        <Select
          options={noteBooksOptions()}
          onChange={onSelectChange}
          defaultValue={noteBookPath}
        />
      </Header>
      <Divider hidden section />
      <Link href={`/pages/new?book=${encodeURIComponent(book)}`} passHref>
        <Button as="a" color="blue">
          Create a new page
        </Button>
      </Link>
      <Segment>
        <Tab
          panes={panes(data)}
          menu={{ pointing: true, className: "Tab-wrapped" }}
          activeIndex={tabActiveIndex}
          onTabChange={handleTabChange}
        />
      </Segment>
      {destroyNotebook(data)}
    </>
  );
};

export default Pages;
