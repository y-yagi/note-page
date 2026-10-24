import { useState, useEffect, useMemo, useCallback } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Formik } from "formik";
import SimpleMDE from "easymde";
import { Button, Form } from "semantic-ui-react";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import "easymde/dist/easymde.min.css";
import "react-semantic-toasts/styles/react-semantic-alert.css";
import Page from "../types/page";
import { showApiError } from "../lib/api";
import { useFormGuard } from "../lib/useFormGuard";

interface Props {
  page: Page;
  notebook: string;
  action: Function;
}

const SimpleMdeReact = dynamic(import("react-simplemde-editor"), {
  ssr: false,
});

const PageForm: NextPage<Props> = ({ page, notebook, action }) => {
  const router = useRouter();
  const [name, setName] = useState(page.name);
  const [content, setContent] = useState(page.content);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (page.id !== 0 && e.ctrlKey && e.key === "s") {
      e.preventDefault();
      let msg = "Content doesn't changed";

      setTimeout(async () => {
        if (page.content !== content) {
          try {
            await action(name, content);
            msg = "Updated!";
            page.content = content;
          } catch (err) {
            showApiError(err);
            return;
          }
        }
        toast({ title: "info", description: msg });
      }, 500);
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
      <SemanticToastContainer />
      <h3 className="mb-8 text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
        Pages
      </h3>
      <Formik
        initialValues={{
          name: page.name,
          content: content,
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await action(name, content);
            router.push(`/?book=${encodeURIComponent(notebook)}`);
          } catch (e) {
            showApiError(e);
            setSubmitting(false);
          }
        }}
        enableReinitialize={true}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Field required>
              <label>Page Name</label>
              <input
                placeholder="Name"
                required
                name="name"
                onChange={onNameChange}
                value={name}
                data-testid="pagename"
              />
            </Form.Field>
            <Form.Field required>
              <label>Content</label>
              <SimpleMdeReact
                value={content}
                onChange={onMDEchange}
                options={simpleMDEOptions}
              />
            </Form.Field>
            <Button
              type="button"
              color="red"
              floated="left"
              onClick={() => router.back()}
            >
              cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              color="blue"
              floated="right"
            >
              submit
            </Button>
          </Form>
        )}
      </Formik>
    </section>
  );
};

export default PageForm;
