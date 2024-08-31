import { ReactNode } from "react";
import { ZodRawShape } from "zod";
import { ControllerField, FormControl } from "../types";
import { useController } from "../hooks";

type Props<T extends ZodRawShape> = {
  name: keyof T;
  control: FormControl<T>;
  render: (field: ControllerField<T>) => ReactNode;
};

export function Controller<T extends ZodRawShape>({
  name,
  control,
  render,
}: Props<T>) {
  const field = useController({
    control,
    name,
  });

  return render(field);
}
