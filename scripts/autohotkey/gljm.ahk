GroupAdd OneNoteGroup, ahk_exe onenote.exe

; docs  https://ahkcn.github.io/docs/misc/Clipboard.htm
; WIN   的符号是  #
; Ctrl  的符号是  ^
; Alt   的符号是  !
; Shift 的符号是  +

;;换行
;;光标左移(Ctrl+;)
$^;::
Send {Enter 10}
return

;;移动光标
;;光标左移(Ctrl+b)
$^b::
Send {Left}
return

;;光标右移(Ctrl+f)
$^f::
Send {Right}
return

;;光标上移(Ctrl+p)
;;OneNote中无法直接映射上下,改成^Up
$^p::
if WinActive("ahk_group OneNoteGroup") {
   Send ^{Up}
}
else {
   Send,{Up}
}
return

;;光标下移(Ctrl+n)
;;OneNote中无法直接映射上下,改成^D
$^n::
if WinActive("ahk_group OneNoteGroup") {
   Send ^{Down}
}
else {
   Send,{Down}
}
return

;;光标移动到下个单词(Ctrl+Alt+f)
$^!f::
Send ^{Right}
return

;;光标移动到上个单词(Ctrl+Alt+b)
$^!b::
Send ^{Left}
return

;;光标移动到行首(Ctrl+a)
$^a::
Send {Home}
return

;;光标移动到行末(Ctrl+e)
$^e::
Send {End}
return

;;删除
;;向左删除(Ctrl+h)
$^h::
Send {Backspace}
return

;;向右删除(Ctrl+d)
$^d::
Send {Del}
return

;;向左删除单词(Ctrl+Alt+h)
$^!h::
Send ^{Backspace}
return

/*  ;;向右删除单词(Ctrl+Alt+d) win10 上 Ctrl+Alt+Del 键位冲突
$^!d::
Send ^{Del}
return
*/

;;向右删除单词(Ctrl+Win+d)
$^#d::
Send ^{Del}
return

;;删除当前位置到行尾(Ctrl+k)
$^k::
Send +{End}
Send {Del}
return

;;删除当前位置到行首(Ctrl+u)
$^u::
Send +{Home}
Send {Backspace}
return


;;重新利用被占用热键
;;(Alt+r)代替(替换)
$!r::
Send ^{r}
return

;;(Alt+f)代替(查找)
$!f::
Send ^{f}
return

;;(Alt+Shift+f)代替(全局查找)
$!+f::
Send ^+{f}
return

;;(Alt+Shift+r)代替(全局替换)
$!+r::
Send ^+{r}
return

;;(Alt+n)代替(新建)
$!n::
Send ^{n}
return

;;(Alt+a)代替(全选)
$!a::
Send ^{a}
return

;;(Alt+h)代替(chrome查看历史记录)
$!h::
Send ^{h}
return

;;(Alt+e)代替(pycharm查看历史记录，chrome 搜索)
$!e::
Send ^{e}
return

;;(Ctrl+j)代替(回车)
$^j::
Send +{Enter}
return

; shift
;;(Ctrl+Shift+b)代替(shift+光标左移)
$^+b::
Send +{Left}
return

;;(Ctrl+Shift+f)代替(shift+光标右移)
$^+f::
Send +{Right}
return

;;(Ctrl+Shift+Alt+f)代替(shift+光标移动到下个单词)
$+^!f::
Send +^{Right}
return

;;(Ctrl+Shift+Alt+b)代替(shift+光标移动到上个单词)
$+^!b::
Send +^{Left}
return

;; (Ctrl+Shift+p)代替(shift+光标上移)
$+^p::
Send +{up}
return

;; (Ctrl+Shift+n)代替(shift+光标下移)
$+^n::
Send +{down}
return