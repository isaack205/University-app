import Header from './header.jsx';
import Footer from './footer.jsx';
import { BackgroundGradientAnimation } from '../ui/background-gradient-animation.jsx';
export default function Layout ({ children }) {
    return (
        <div className='flex flex-col min-h-screen'>
            <Header/>
                <div className='flex-1 lg:ml-95 m-5'>
                    {children}
                </div>
            <Footer />
        </div>
    )
}
