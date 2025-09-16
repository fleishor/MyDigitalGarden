---
showOnIndexPage: false
date: 2024-11-08
title: Setup password-less SSH login
image: LinuxCommandLine.png
description:
tags: 
- Linux
---

## Reference

- [# How to Setup Passwordless SSH Login](https://linuxize.com/post/how-to-setup-passwordless-ssh-login/)

## Generate a new SSH key pair

~~~
fleishor@desktop:~$ ssh-keygen -t rsa -b 4096
Generating public/private rsa key pair.
Enter file in which to save the key (/home/fleishor/.ssh/id_rsa): 
/home/fleishor/.ssh/id_rsa already exists.
Overwrite (y/n)? y
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /home/fleishor/.ssh/id_rsa
Your public key has been saved in /home/fleishor/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:tF6w34/VwiU0A6Zv0INQbKrjnd6JtkyrSREcYva2LJ4 fleishor@desktop
The key's randomart image is:
+---[RSA 4096]----+
|    + . .o. o    |
|   o + . .o= .   |
|      = oo+ o +  |
|     o +.+ o o o |
|    . +.S . o . .|
|   . ooo o o . + |
|    E..oo.. . + .|
|     ..+++ . + . |
|      o+*.o . .  |
+----[SHA256]-----+
fleishor@desktop:~$
~~~

## Copy the public key to remote machine

~~~
fleishor@desktop:~$ ssh-copy-id pi@docker.fritz.box
/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/home/fleishor/.ssh/id_rsa.pub"
The authenticity of host 'docker.fritz.box (192.168.178.19)' can't be established.
ED25519 key fingerprint is SHA256:/ozSko5DtpT/z7+JbkGwTSAcwUn2RJt3BsE26Cx7Ah8.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
pi@docker.fritz.box's password: 

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'pi@docker.fritz.box'"
and check to make sure that only the key(s) you wanted were added.

fleishor@desktop:~$ 
~~~

## Check ssh to remote machine

~~~
leishor@desktop:~$ ssh 'pi@docker.fritz.box'
Linux docker 5.10.103-v8+ #1529 SMP PREEMPT Tue Mar 8 12:26:46 GMT 2022 aarch64

The programs included with the Debian GNU/Linux system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Debian GNU/Linux comes with ABSOLUTELY NO WARRANTY, to the extent
permitted by applicable law.
Last login: Fri Nov  8 16:44:21 2024 from 192.168.178.44

SSH is enabled and the default password for the 'pi' user has not been changed.
This is a security risk - please login as the 'pi' user and type 'passwd' to set a new password.


Wi-Fi is currently blocked by rfkill.
Use raspi-config to set the country before use.

pi@docker:~ $
~~~
