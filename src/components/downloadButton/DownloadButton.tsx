"use client";
import styles from "./DownloadButton.module.css";
import { useFormStatus } from "react-dom";



export default function DownloadButton(){
    const {pending} = useFormStatus();
    async function download(){
        window.open('/api/webscraper', '_blank');
    }
    return(
        <form action={download} className={styles.form}>
            <button type="submit" name="submit" disabled = {pending}>Download</button>
        </form>
    )
     
}