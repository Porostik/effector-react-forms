import { ZodRawShape } from "zod";
import { Form, FieldUnits, RawShapeToObj } from "../types";
import { ChangeEvent, FormEvent } from "react";
import { useUnit } from "effector-react";

export const useForm = <T extends ZodRawShape>(form: Form<T>) => {
  const { formValues, formErrors, isValid } = useUnit({
    formValues: form.$formValues,
    formErrors: form.$formErrors,
    isValid: form.$isValid,
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

  const register = <TName extends keyof T>(name: TName) => ({
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
    control: {
      register,
      formValues,
      formErrors,
    },
    handleSubmit,
    formValues,
    register,
    formErrors,
    isValid,
  };
};
