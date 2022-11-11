import { ComponentPropsWithoutRef } from 'react';

interface PropsType extends ComponentPropsWithoutRef<'span'> {
  message?: string;
}

export function HelloWorld({ message = 'hello world', ...spanProps}: PropsType) {

  return <span {...spanProps}>{message}</span>;
}

