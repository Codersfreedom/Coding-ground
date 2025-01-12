import {CodeEditorState} from "@/types";
import {create} from "zustand";
import {Monaco} from "@monaco-editor/react";


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
        fontSize:savedFontSize,
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
    }
})
