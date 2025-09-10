import React from "react";

export default function Footer () {

    return (
        <div className="border flex align-center justify-center">
            <p>{new Date().getFullYear()} © All rights reserved</p>
        </div>
    )
}