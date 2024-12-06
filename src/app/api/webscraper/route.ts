import { readFile } from "fs/promises";
import path from "path";
import {fileURLToPath} from 'url';
import main from "@/lib/webscraper";
import { NextRequest } from "next/server";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dynamic = "force-dynamic";

export async function GET(){
    try{
        const buffer = await readFile(path.join(__dirname,'..','..','..','lib','article_table.csv'));
        const headers = new Headers();
        headers.append('Content-Disposition', 'attachment; filename="article_table.csv"; filename*="article_table.csv"');
        headers.append('Content-Type', 'application/octet-stream; charset=utf-8');
        return new Response(buffer, {headers});

    }catch(err){
        console.log(err);
        throw new Error("Download failed. Please try again later.")
    }
}
export async function POST(req : NextRequest){
    // console.log(await req.json());
    const data = await req.json();
    const table_data = await main(data.term, data.startDate, data.endDate, data.bbc, data.cnn, data.fox, data.kmbc);
    return new Response(table_data);
}