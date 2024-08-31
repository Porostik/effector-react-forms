import { ZodError, ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { combine, createEvent, createStore, sample } from "effector";
import { Fields, Form, FormErrors, RawShapeToObj } from "../types";
import { createField } from "./field";

export const formFabric = <T extends ZodRawShape>(
  schema: ZodObject<T>
): Form<T> => {
  const $formValues = createStore<RawShapeToObj<T>>({} as RawShapeToObj<T>);
  const $formErrors = createStore<FormErrors<T>>(null);

  const errorSettled = createEvent<{ name: keyof T; error: ZodError }>();
  const resetError = createEvent<keyof T>();

  $formErrors
    .on(errorSettled, (state, payload) => {
      if (!state)
        return {
          [payload.name]: payload.error.errors[0].message,
        } as FormErrors<T>;
      return {
        ...state,
        [payload.name]: payload.error.errors[0].message,
      } as FormErrors<T>;
    })
    .on(resetError, (state, payload) => {
      if (!state) return null;
      delete state[payload];
      if (!Object.keys(state).length) return null;
      return state;
    });

  const createFormField = (name: string, type: ZodTypeAny) => {
    const field = createField<typeof type, typeof name>(name);
    const value = field.value;
    const onChange = field.onChange;
    value.on(onChange, (_, payload) => payload);
    sample({
      clock: onChange,
      filter: (v) => {
        const { success } = type.safeParse(v);
        return success;
      },
      target: value,
    });
    sample({
      clock: onChange,
      filter: (v) => {
        const { success } = type.safeParse(v);
        return !success;
      },
      fn: (v) => ({
        name: name as keyof T,
        error: type.safeParse(v).error as ZodError,
      }),
      target: errorSettled,
    });
    sample({
      clock: onChange,
      source: $formErrors,
      filter: (errors, v) => {
        const { success } = type.safeParse(v);
        return success && !!errors?.[name];
      },
      fn: () => name as keyof T,
      target: resetError,
    });
    $formValues.on(onChange, (state, payload) => ({
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

  const $isValid = combine(
    { formErrors: $formErrors },
    ({ formErrors }) => !formErrors
  );

  return {
    fields,
    $formValues,
    $isValid,
    $formErrors,
  };
};
