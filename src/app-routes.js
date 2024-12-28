import { HomePage, TasksPage, ProfilePage,Agenda,FormDemande,VueConges,VueCongesManager,Historique,Statusm,MyHistory,History} from './pages';
import { withNavigationWatcher } from './contexts/navigation';


export  const routes = [
   
    {
        path: '/profile',
        element: ProfilePage
    },
    {
        path: '/scheduler',
        element: Agenda
    },
   
    {
        path: '/formDemande',
        element: FormDemande
    },
    {
        path: '/vuecongés',
        element: VueConges
    },
   
    
    {
        path: '/history',
        element: MyHistory
    },
    
    

];

export default routes.map(route => {
    return {
        ...route,
        element: withNavigationWatcher(route.element, route.path)
    };
});

