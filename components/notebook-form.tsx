import { Formik } from "formik";
import { useRouter } from "next/router";
import { NextPage } from "next";
import Notebook from "../types/notebook";

interface Props {
  notebook: Notebook;
  action: Function;
}

const NotebookForm: NextPage<Props> = ({ notebook, action }) => {
  const router = useRouter();

  return (
    <section>
      <h3 className="mb-8 text-6xl md:text-7xl font-bold tracking-tighter leading-tight">
        Notebooks
      </h3>
      <Formik
        initialValues={{
          id: "",
        }}
        onSubmit={(values, { setSubmitting }) => {
          action(values["id"]);
          router.push("/");
        }}
        enableReinitialize={true}
      >
        {({ values, handleChange, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-field">
              <label className="block font-bold mb-2">
                Notebook ID<span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                placeholder="ID"
                required
                name="id"
                onChange={handleChange}
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

export default NotebookForm;
