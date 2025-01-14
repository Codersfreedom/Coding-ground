import {CodeEditorState} from "@/types";
import {create} from "zustand";
import {Monaco} from "@monaco-editor/react";
import {LANGUAGE_CONFIG} from "@/app/(root)/_constants";


const getInitialState = ()=> {

    if(typeof window === "undefined"){

    return {
        language: "javascript",
        fontSize: 16,
        theme: "vs-dark",
    }
    }
    // if it's on client side return values from browser localstorage
    const savedLanguage = localStorage.getItem("editor-language") || "javascript";
    const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
    const savedFontSize = localStorage.getItem("editor-fontSize") || 16;

    return {
        language:savedLanguage,
        fontSize:Number(savedFontSize),
        theme:savedTheme,
    }
}

export const useCodeEditorStore = create<CodeEditorState>((set,get)=>{
    const initialState = getInitialState();
    return {
        ...initialState,
        editor:null,
        error:null,
        output:"",
        isRunning:false,
        executionResult:null,

        getCode:()=>get().editor?.getValue() || "",

        setEditor:(editor:Monaco)=>{
            const savedCode = localStorage.getItem(`editor-code-${get().language}`);
            if(savedCode) editor.setValue(savedCode);

            set({editor})
        },

        setLanguage:(language:string)=>{
            const currentCode = get().editor?.getValue();
            if(currentCode){
            localStorage.setItem(`editor-code-${get().language}`,currentCode);

            }
            localStorage.setItem(`editor-language`,language);

            set({
                language,
                output: "",
                error: null,
            });

        },
        setTheme:(theme:string)=>{
            localStorage.setItem(`editor-theme`,theme);
            set({theme});
        },
        setFontSize:(fontSize:number)=>{
            localStorage.setItem(`editor-fontSize`,fontSize.toString());
            set({fontSize});
        },
        runCode:async () => {
            const { language, getCode } = get();
            const code = getCode();

            if (!code) {
                set({ error: "Please enter some code" });
                return;
            }

            set({ isRunning: true, error: null, output: "" });

            try {
                const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
                const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        language: runtime.language,
                        version: runtime.version,
                        files: [{ content: code }],
                    }),
                });

                const data = await response.json();

                console.log("data back from piston:", data);

                // handle API-level erros
                if (data.message) {
                    set({ error: data.message, executionResult: { code, output: "", error: data.message } });
                    return;
                }

                // handle compilation errors
                if (data.compile && data.compile.code !== 0) {
                    const error = data.compile.stderr || data.compile.output;
                    set({
                        error,
                        executionResult: {
                            code,
                            output: "",
                            error,
                        },
                    });
                    return;
                }

                if (data.run && data.run.code !== 0) {
                    const error = data.run.stderr || data.run.output;
                    set({
                        error,
                        executionResult: {
                            code,
                            output: "",
                            error,
                        },
                    });
                    return;
                }

                // if we get here, execution was successful
                const output = data.run.output;

                set({
                    output: output.trim(),
                    error: null,
                    executionResult: {
                        code,
                        output: output.trim(),
                        error: null,
                    },
                });
            } catch (error) {
                console.log("Error running code:", error);
                set({
                    error: "Error running code",
                    executionResult: { code, output: "", error: "Error running code" },
                });
            } finally {
                set({ isRunning: false });
            }
        },
    }
})

export const getCodeExecutionResult = () => {
    return useCodeEditorStore.getState().executionResult;
}