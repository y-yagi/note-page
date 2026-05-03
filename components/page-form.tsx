import { useState, useEffect, useMemo, useCallback } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Formik } from "formik";
import SimpleMDE from "easymde";
import "easymde/dist/easymde.min.css";
import Page from "../types/page";
import { useFormGuard } from "../lib/useFormGuard";

interface Props {
  page: Page;
  action: Function;
}

const SimpleMdeReact = dynamic(import("react-simplemde-editor"), {
  ssr: false,
});

const PageForm: NextPage<Props> = ({ page, action }) => {
  const router = useRouter();
  const [name, setName] = useState(page.name);
  const [content, setContent] = useState(page.content);
  const [toastMessage, setToastMessage] = useState("");

  const handleKeyPress = (e: KeyboardEvent) => {
    if (page.id !== "" && e.ctrlKey && e.key === "s") {
      e.preventDefault();
      let msg = "Content doesn't changed";

      setTimeout(() => {
        if (page.content !== content) {
          action(name, content);
          msg = "Updated!";
        }
        page.content = content;
      }, 500);

      setTimeout(() => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
      }, 1000);
    }
  };

  const onMDEchange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const onNameChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      setName(ev.target.value);
    },
    [],
  );

  const simpleMDEOptions = useMemo(() => {
    return {
      autofocus: true,
      spellChecker: false,
      inputStyle: "textarea",
      status: false,
      hideIcons: ["itaclic", "quote", "image", "link", "guide"],
    } as SimpleMDE.Options;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  });

  const isContentUpdated = () => {
    return page.content !== content;
  };

  useFormGuard(isContentUpdated());

  return (
    <section>
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}
      <h3 className="mb-8 text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
        Pages
      </h3>
      <Formik
        initialValues={{
          name: page.name,
          content: content,
        }}
        onSubmit={(values, { setSubmitting }) => {
          action(name, content);
          router.push(`/?book=${page.noteBookId}`);
        }}
        enableReinitialize={true}
      >
        {({ handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-field">
              <label className="block font-bold mb-2">
                Page Name<span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="Name"
                required
                name="name"
                onChange={onNameChange}
                value={name}
                data-testid="pagename"
              />
            </div>
            <div className="form-field">
              <label className="block font-bold mb-2">
                Content<span className="text-red-500">*</span>
              </label>
              <SimpleMdeReact
                value={content}
                onChange={onMDEchange}
                options={simpleMDEOptions}
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="btn btn-red"
                onClick={() => router.back()}
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-blue"
              >
                submit
              </button>
            </div>
          </form>
        )}
      </Formik>
    </section>
  );
};

export default PageForm;
