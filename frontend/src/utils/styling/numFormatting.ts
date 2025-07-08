// Misc. Formatting Helpers

export const dateFormat = new Intl.DateTimeFormat("en-US", {
    year  : "numeric",
    month : "short", 
    day   : "2-digit" 
});

export const dateFormatShort = new Intl.DateTimeFormat("en-US", {
    month : "short", 
    day   : "2-digit" 
});

export const dateFormatLong = new Intl.DateTimeFormat("en-US", {
    year   : "numeric",
    month  : "short", 
    day    : "2-digit",
    hour   : "2-digit",
    minute : "2-digit",
});


