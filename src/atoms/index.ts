import { atom, useAtom } from "jotai";

export const estuaryPageAtom = atom<number>(0);
export const selectedFileAtom = atom<File>();
export const isLoginAtom = atom<boolean>(false);
