import {
  createEvent,
  createStore,
  EventCallable,
  StoreWritable,
} from "effector";
import { Field, FieldUnit } from "../types";
import { z, ZodTypeAny } from "zod";

export class _Field<TValue extends ZodTypeAny, TName extends string>
  implements Field<TValue, TName>
{
  private _value: StoreWritable<TValue>;
  private _onChange: EventCallable<TValue>;

  constructor(private _name: TName) {
    this._value = createStore<TValue>(null as z.infer<TValue>);
    this._onChange = createEvent<TValue>();
  }

  get value() {
    return this._value;
  }
  get onChange() {
    return this._onChange;
  }

  get unit() {
    return {
      [`${this._name}Value`]: this._value,
      [`onChange${this._name}`]: this._onChange,
    } as FieldUnit<TValue, TName>;
  }
}

export const createField = <TValue extends ZodTypeAny, TName extends string>(
  name: TName
) => new _Field<TValue, TName>(name);
