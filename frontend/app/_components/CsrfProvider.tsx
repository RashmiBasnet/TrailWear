"use client";

import { createContext, useContext } from "react";

const CsrfContext = createContext<string>("");

export default function CsrfProvider({
    token,
    children,
}: {
    token: string;
    children: React.ReactNode;
}) {
    return <CsrfContext.Provider value={token}>{children}</CsrfContext.Provider>;
}

export function useCsrf() {
    return useContext(CsrfContext);
}
