-- Default the platform to light mode.
alter table organizations alter column theme set default 'light';
update organizations set theme = 'light' where theme = 'dark';
