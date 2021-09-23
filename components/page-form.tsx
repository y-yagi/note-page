import Page from "../types/page";
import { Formik } from "formik";
import { useMemo } from "react";
import { Button, Form } from "semantic-ui-react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { useState } from "react";
import { SimpleMdeReact } from "react-simplemde-editor";
import SimpleMDE from "easymde";
import "easymde/dist/easymde.min.css";

interface Props {
  page: Page;
  action: Function;
}

const PageForm: NextPage<Props> = ({ page, action }) => {
  const router = useRouter();
  const [content, setContent] = useState(page.content);

  function onMDEchange(value: string) {
    setContent(value);
  }

  const simpleMDEOptions = useMemo(() => {
    return {
      autofocus: true,
      spellChecker: false,
    } as SimpleMDE.Options;
  }, []);

  return (
    <section>
      <h3 className="mb-8 text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
        Pages
      </h3>
      <Formik
        initialValues={{
          name: page.name,
          content: page.content,
        }}
        onSubmit={(values, { setSubmitting }) => {
          action(values["name"], content);
          router.push(`/?book=${page.noteBookId}`);
        }}
        enableReinitialize={true}
      >
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Field required>
              <label>Page Name</label>
              <input
                placeholder="Name"
                required
                name="name"
                onChange={handleChange}
                value={values.name}
                data-testid="pagename"
              />
            </Form.Field>
            <Form.Field required>
              <label>Content</label>
              <SimpleMdeReact
                value={values.content}
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
