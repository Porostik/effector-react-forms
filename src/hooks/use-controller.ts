import { ZodRawShape } from "zod";
import { FormControl } from "../types";

type Params<T extends ZodRawShape> = {
  control: FormControl<T>;
  name: keyof T;
};

export const useController = <T extends ZodRawShape>({
  control,
  name,
}: Params<T>) => {
  return {
    ...control.register(name),
    error: control.formErrors?.[name],
  };
};
