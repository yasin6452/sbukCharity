import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiUsersDuotone,
    PiUserDuotone,
    PiUserPlusDuotone,
    PiHeartDuotone,
    PiFirstAidKitDuotone,
    PiStethoscopeDuotone,
    PiBuildingsDuotone,
    PiBuildingDuotone,
    PiCityDuotone,
    PiToolboxDuotone,
    PiGiftDuotone,
    PiBriefcaseDuotone,
    PiOptionDuotone,
    PiClipboardTextDuotone,
    PiClipboardDuotone,
    PiChatCircleDuotone
} from 'react-icons/pi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    // اصلی
    home: <PiHouseLineDuotone />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
    
    // مدیریت افراد
    users: <PiUsersDuotone />,
    'user-group': <PiUserDuotone />,
    'user-plus': <PiUserPlusDuotone />,
    heart: <PiHeartDuotone />,
    health: <PiFirstAidKitDuotone />,
    stethoscope: <PiStethoscopeDuotone />,
    
    // مدیریت سازمان‌ها
    building: <PiBuildingDuotone />,
    buildings: <PiBuildingsDuotone />,
    activity: <PiCityDuotone />,
    tool: <PiToolboxDuotone />,
    gift: <PiGiftDuotone />,
    briefcase: <PiBriefcaseDuotone />,
    organization: <PiOptionDuotone />,
    
    // مدیریت درخواست‌ها
    'clipboard-list': <PiClipboardTextDuotone />,
    service: <PiClipboardDuotone />,
    'message-circle': <PiChatCircleDuotone />
}

export default navigationIcon