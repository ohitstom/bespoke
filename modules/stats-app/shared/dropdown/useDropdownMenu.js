import { S } from "/modules/std/index.js";
const { React } = S;
import DropdownMenu from "./dropdown.js";
import { storage } from "../../index.js";
const useDropdownMenu = (options, storageVariable) => {
    const initialOptionID = storageVariable && storage.getItem(`${storageVariable}:active-option`);
    const initialOption = initialOptionID && options.find(e => e.id === initialOptionID);
    const [activeOption, setActiveOption] = React.useState(initialOption || options[0]);
    const [availableOptions, setAvailableOptions] = React.useState(options);
    const dropdown = (S.React.createElement(DropdownMenu, { options: availableOptions, activeOption: activeOption, switchCallback: option => {
            setActiveOption(option);
            if (storageVariable)
                storage.setItem(`${storageVariable}:active-option`, option.id);
        } }));
    return [dropdown, activeOption, setActiveOption, setAvailableOptions];
};
export default useDropdownMenu;