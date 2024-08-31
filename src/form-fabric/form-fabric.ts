import { ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { createStore } from "effector";
import { Fields, RawShapeToObj } from "../types";
import { createField } from "./field";

export const formFabric = <T extends ZodRawShape>(schema: ZodObject<T>) => {
  const formValues = createStore<RawShapeToObj<T>>({} as RawShapeToObj<T>);

  const createFormField = (name: string, type: ZodTypeAny) => {
    const field = createField<typeof type, typeof name>(name);
    const value = field.value;
    const onChange = field.onChange;
    value.on(onChange, (_, payload) => payload);
    formValues.on(onChange, (state, payload) => ({
      ...state,
      [name]: payload,
    }));
    return field;
  };

  const createFields = () => {
    const entities = schema.shape;

    return Object.entries(entities).reduce(
      (acc, [key, type]) => ({
        ...acc,
        [key]: createFormField(key, type),
      }),
      {} as Fields<T>
    );
  };

  const fields = createFields();

  return {
    fields,
    formValues,
  };
};
