import { ZodRawShape } from "zod";
import { useUnit } from "effector-react";
import { FieldUnits, Form, RawShapeToObj } from "../types";
import { ChangeEvent, FormEvent } from "react";

export const useForm = <T extends ZodRawShape>(form: Form<T>) => {
  const { formValues } = useUnit({
    formValues: form.formValues,
  });

  const { ...fields } = useUnit({
    ...Object.keys(form.fields as keyof T).reduce(
      (acc, field) => ({
        ...acc,
        ...form.fields[field].unit,
      }),
      {} as FieldUnits<T>
    ),
  });

  const handleSubmit = (fn: (data: RawShapeToObj<T>) => void) => {
    return (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      fn(formValues);
    };
  };

  const register = (name: keyof T) => ({
    name,
    onChange: (e: ChangeEvent<HTMLInputElement>) => {
      const handler = fields[`onChange${name as string}`];

      if (typeof handler === "function") {
        handler(e.target.value);
      }
    },
    value: fields[`${name as string}Value`] ?? "",
  });

  return {
    handleSubmit,
    formValues,
    register,
  };
};
