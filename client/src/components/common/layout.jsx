import Header from './header.jsx';
import Footer from './footer.jsx';
import { BackgroundGradientAnimation } from '../ui/background-gradient-animation.jsx';
export default function Layout ({ children }) {
    return (
        <div className='flex flex-col min-h-screen'>
            <Header/>
                <main className='flex-1 bg-gray-100'>
                    <div className='lg:ml-95 m-5'>
                        {children}
                    </div>
                </main>
            <Footer />
        </div>
    )
}
