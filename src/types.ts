import { EventCallable, StoreWritable } from "effector";
import { z, ZodRawShape, ZodTypeAny } from "zod";

export type RawShapeToObj<T extends ZodRawShape> = {
  [key in keyof T]: z.infer<T[key]>;
};

export type Fields<T extends ZodRawShape> = {
  [key in keyof T]: Field<z.infer<T[key]>>;
};

export type Form<T extends ZodRawShape> = {
  fields: Fields<T>;
  formValues: StoreWritable<RawShapeToObj<T>>;
};

export type FieldUnit<TValue extends ZodTypeAny, TName extends string> = {
  [key in `onChange${TName}`]: EventCallable<z.infer<TValue>>;
} & {
  [key in `${TName}Value`]: StoreWritable<z.infer<TValue>>;
};

export interface Field<TValue extends ZodTypeAny, TName extends string = ""> {
  get value(): StoreWritable<z.infer<TValue>>;
  get onChange(): EventCallable<z.infer<TValue>>;

  get unit(): FieldUnit<z.infer<TValue>, TName>;
}

export type FieldUnits<T extends ZodRawShape> = {
  [key in keyof T as `onChange${key & string}`]: EventCallable<z.infer<T[key]>>;
} & {
  [key in keyof T as `${key & string}Value`]: StoreWritable<z.infer<T[key]>>;
};
