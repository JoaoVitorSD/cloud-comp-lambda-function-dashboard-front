import { Box } from "@types";
import BoxStyle from '@styles/Box.module.css'
export default function Box({ name, description, value, isLoading}: Box){
    return (
        <div className={BoxStyle['box']} >
        <div className={BoxStyle['box-info']}>
        <p>{name}</p>
        <span>{description}</span>
        </div>
        <p className={`${isLoading? BoxStyle["loading-info"]: null}`}>{value!=null?value.toFixed(2)+'%': '-'}</p>
        </div>
    )
}