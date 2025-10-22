import React from "react";

export default function Footer () {

    return (
        <div className="rounded-t-xl bg-blue-400 dark:bg-slate-800 p-3 flex flex-col items-center justify-center">
            <p>{new Date().getFullYear()} © All rights reserved</p>
            <span className="flex gap-2">
                <p>Designed by</p>
                <a className="text-pink-700 font-bold hover:underline hover:text-pink-800" target="blank" href="https://my-portfolio-ivory-five-28.vercel.app/">Isaac kahura</a>
            </span>
        </div>
    )
}