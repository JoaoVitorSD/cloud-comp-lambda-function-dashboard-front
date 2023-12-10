import { Box } from "@types";
import BoxStyle from '@styles/Box.module.css'
export default function Box({ name, description, value}: Box){
    return (
        <div className={BoxStyle['box']} >
        <div className={BoxStyle['box-info']}>
        <p>{name}</p>
        <span>{description}</span>
        </div>
        <p>{value!=null?value.toFixed(2)+'%': '-'}</p>
        </div>
    )
}