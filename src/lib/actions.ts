"use server";
import { revalidatePath } from "next/cache";
import { writeFile,  readFile } from "fs/promises";
import parse from "html-react-parser";
import path from "path";
import {fileURLToPath} from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export async function query(previousState: any, formData: FormData){
    const query = {
        term: formData.get("term") as string,
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        bbc: formData.get("bbc"),
        cnn: formData.get("cnn"),
        fox: formData.get("fox"),
        kmbc: formData.get("kmbc")
    }


    if (query.startDate == "" || query.endDate == ""){
        return {error: "Please enter dates for all fields"}
    }
    if(query.bbc == null && query.cnn == null && query.fox == null && query.kmbc == null){
        return {error: "Please select atleast one news site"}
    }

    const minDate = new Date();
    minDate.setDate(minDate.getDate() - 365);
    const maxDate = new Date();
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    if(query.term == ''){
        return {error: "Please enter a search term"}
    }
    if(startDate < minDate || endDate < minDate){
        return {error: "Please choose a more recent date"}
    }
    if(endDate > maxDate || startDate > maxDate){
        return {error: "Please a choose a previous or current date"}
    }
    if(startDate > endDate){
        return {error: "End date must be more recent than Start date"}
    }

    try{
        const response = await fetch('http://127.0.0.1:3001/api/webscraper', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(query)
        })
        if(!response.ok){
            return {error: "Something went wrong server - side"};
        }
    
        const result =  response.text()
        const tableData = await result;
        if(tableData == ""){return {error: "No results found. Please try again."}}
        writeFile(path.join(__dirname, "tableData.ts"), tableData);
        revalidatePath("/");
        return {success: "Table loaded below"}
    }
    catch(error){
        console.log(error);
    }
    
}


export async function getTable(){
    let tableData = "";
    let table = null;  
    try{
        tableData = await readFile(path.join(__dirname,"tableData.ts"), "utf-8");
    }
    catch(err){
        console.log(err);
    }
    if(tableData!==""){
        tableData = tableData.substring(1, tableData.length-1);
        table = parse(tableData)
        tableData = "";
        writeFile(path.join(__dirname, "tableData.ts"), tableData);
    };
    return table;
}

