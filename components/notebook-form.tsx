import { Formik } from "formik";
import { Button, Form } from "semantic-ui-react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { SemanticToastContainer } from "react-semantic-toasts";
import "react-semantic-toasts/styles/react-semantic-alert.css";
import { showApiError } from "../lib/api";
import Notebook from "../types/notebook";

interface Props {
  notebook: Notebook;
  action: Function;
}

const NotebookForm: NextPage<Props> = ({ notebook, action }) => {
  const router = useRouter();

  return (
    <section>
      <SemanticToastContainer />
      <h3 className="mb-8 text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
        Notebooks
      </h3>
      <Formik
        initialValues={{
          name: "",
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await action(values["name"]);
            router.push("/");
          } catch (e) {
            showApiError(e);
            setSubmitting(false);
          }
        }}
        enableReinitialize={true}
      >
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Field required>
              <label>Notebook Name</label>
              <input
                placeholder="Name"
                required
                name="name"
                onChange={handleChange}
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

export default NotebookForm;
