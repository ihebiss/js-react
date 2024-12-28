export const navigation = [
  {
    text: 'Home',
    path: '/scheduler',
    icon: 'home'
  },
  {
    text: 'My personal information',
    icon: 'folder',
    items: [
      {
        text: 'Profile',
        path: '/profile'
      },
    ]
  },
  {
    text: 'Leaves',
    icon: 'folder',
    items: [
      {
        text: 'Leaves overview',
        path: '/vuecongés'
      },
      {
        text: 'My History',
        path: '/history'
      },
    ],
    visible: (roles) => Array.isArray(roles) && roles.includes('TeamLead') 
  },
  {
    text: 'Leaves',
    icon: 'folder',
    items: [
      {
        text: 'Leaves overview',
        path: '/vuecongés'
      },
      {
        text: 'My History',
        path: '/history'
      },
    ],
    visible: (roles) => Array.isArray(roles) && roles.includes('Manager')
  },
  {
    text: 'Leaves',
    icon: 'folder',
    items: [
      {
        text: 'My History',
        path: '/history'
      }
    ],
    visible: (roles) => Array.isArray(roles) && roles.includes('Employee') 
  },
];
