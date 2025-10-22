import Header from './header.jsx';
import Footer from './footer.jsx';
import { Outlet } from 'react-router-dom';

export default function Layout () {
    return (
        <div className='flex flex-col min-h-screen bg-background text-foreground'>
            <Header/>
                <main className='flex-1 bg-gray-100 dark:bg-black dark:text-gray-300 transition-colors duration-200'>
                    <div className='mt-20 lg:ml-95 m-5'>
                        <Outlet />
                    </div>
                </main>
            <Footer />
        </div>
    )
}
