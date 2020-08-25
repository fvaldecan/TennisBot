module.exports = class Extensions {
    static addAll() { 
        require("./colors")();
        require("./message")();
    }
};
