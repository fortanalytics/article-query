import type { Metadata } from "next";
import styles from "./page.module.css";
import Form from "@/components/form/Form";
import DownloadButton from "@/components/downloadButton/DownloadButton";
import { getTable } from "@/lib/actions";


export const metadata: Metadata = {
    title: "Article Query",
    description: "Webscraping Application",
  };
  
export const fetchCache = 'force-cache';

export default async function Page(){
    const table = await getTable();
    return(
        <div className={styles.container}>
            <Form/>
            {table!==null ? 
                <>
                    <DownloadButton/>
                    <div className={styles.tableContainer}>
                        { table }
                    </div>
                </>
            :null}
            
        </div>
    )
}



