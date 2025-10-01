// Imports
import React, {useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";

export default function AdminDashboard() {

    const { user, hasRole } = useAuth();

    return(
        <div>
            {hasRole('admin') && 
                <div></div>
            }
        </div>
    )
}
