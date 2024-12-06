"use client";
import {useFormStatus } from "react-dom";



export default function SubmitButton(){
    const {pending} = useFormStatus();
    return(
        <button type="submit" name="submit" disabled={pending}>{pending ? "Searching..." : "Search"}</button>
    )
}