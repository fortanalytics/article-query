"use client";
import styles from "./Form.module.css";
import SubmitButton from "./SubmitButton";
import { useFormState} from "react-dom";
import { query } from "@/lib/actions";


function mindate(num:number):string{
    const date = new Date();
    date.setDate(date.getDate() - num);
    return date.toLocaleDateString("ko-KR").split('. ').join('-').replace('.','');
}

function maxdate():string{
    const date = new Date();
    return date.toLocaleDateString("ko-KR").split('. ').join('-').replace('.','');
}




export default function Form(){
    const [state, formAction] = useFormState(query, undefined);
    return(
        <form action={formAction} className={styles.form}>
                <input type="text" id="term" name="term" placeholder="Enter news topic here"/>
                <input type="date" id="startDate" name="startDate" min={mindate(365)} />
                <input type="date" id="endDate" name="endDate" max={maxdate()}/>
                <div id="sites" className={styles.sites}>
                    <input type="checkbox" id="bbc" name="bbc" value="true"/>
                    <label htmlFor="bbc">h</label><br/> {/*The BBC logo is mapped to 'h' in the ttf font file */}
                    <input type="checkbox" id="cnn" name="cnn" value="true"/>
                    <label htmlFor="cnn">CNN</label><br/>
                    <input type="checkbox" id="fox" name="fox" value="true"/>
                    <label htmlFor="fox"><p>FOX</p><p>NEWS</p></label>
                    <input type="checkbox" id="kmbc" name="kmbc" value="true"/>
                    <label htmlFor="kmbc">KMBC</label><br/>
                </div>
                <SubmitButton/>
                <div>{state?.error}</div>
        </form>
    )
}