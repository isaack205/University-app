import React from "react";
import Home from "./components/home";
import Layout from '@/components/common/layout';

export default function App () {
  return (
    <div>
      <Layout>
        <Home />
      </Layout>
    </div>
  )
}