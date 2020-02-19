! function (a) {
    "use strict";
    "function" == typeof define && define.amd ? define(["jquery", "../grid.base"], a) : a(jQuery)
}(function (a) {
    a.jgrid = a.jgrid || {}, a.jgrid.hasOwnProperty("regional") || (a.jgrid.regional = []), a.jgrid.regional.en = {
        defaults: {
            recordtext: "Visualizar {0} - {1} de {2}",
            emptyrecords: "Não há registros para visualizar",
            loadtext: "Carregando ...",
            savetext: "Salvando ...",
            pgtext: "Página {0} de {1}",
            pgfirst: "Primeira página",
            pglast: "Última página",
            pgnext: "Próxima página",
            pgprev: "Página anterior",
            pgrecs: "Registros por página",
            showhide: "Alternar para expandir a grade de recolhimento",
            pagerCaption: "Grade :: Configurações da página",
            pageText: "Página:",
            recordPage: "Registros por página",
            nomorerecs: "Chega de registros ...",
            scrollPullup: "Puxe para cima para carregar mais ...",
            scrollPulldown: "Puxe para baixo para atualizar ...",
            scrollRefresh: "Solte para atualizar ..."
        },
        search: {
            caption: "Pesquisar...",
            Find: "Procurar",
            Reset: "Redefinir",
            odata: [{
                oper: "eq",
                text: "igual"
            }, {
                oper: "ne",
                text: "não é igual"
            }, {
                oper: "lt",
                text: "menos"
            }, {
                oper: "le",
                text: "menor ou igual"
            }, {
                oper: "gt",
                text: "maior"
            }, {
                oper: "ge",
                text: "maior ou igual"
            }, {
                oper: "bw",
                text: "começa com"
            }, {
                oper: "bn",
                text: "não começa com"
            }, {
                oper: "in",
                text: "está dentro"
            }, {
                oper: "ni",
                text: "não está em"
            }, {
                oper: "ew",
                text: "termina com"
            }, {
                oper: "en",
                text: "não termina com"
            }, {
                oper: "cn",
                text: "contém"
            }, {
                oper: "nc",
                text: "não contém"
            }, {
                oper: "nu",
                text: "é nulo"
            }, {
                oper: "nn",
                text: "não é nulo"
            }],
            groupOps: [{
                op: "AND",
                text: "todos"
            }, {
                op: "OU",
                text: "qualquer"
            }],
            operandTitle: "Clique para selecionar a operação de pesquisa.",
            resetTitle: "Redefinir valor de pesquisa"
        },
        edit: {
            addCaption: "Adicionar registro",
            editCaption: "Editar registro",
            bSubmit: "Enviar",
            bCancelar: "Cancelar",
            bFeche: "Fechar",
            saveData: "Os dados foram alterados! Salvar alterações?",
            Sim: "Sim",
            bNo: "Não",
            bExit: "Cancelar",
            msg: {
                required: "O campo é obrigatório",
                number: "Digite um número válido",
                minValue: "o valor deve ser maior ou igual a",
                maxValue: "o valor deve ser menor ou igual a",
                email: "não é um email válido",
                integer: "Digite um valor inteiro válido",
                date: "Digite um valor de data válido",
                url: "não é um URL válido. Prefixo necessário ('http: //' ou 'https: //')",
                nodefined: "não está definido!",
                novalue: "o valor de retorno é necessário!",
                customarray: "Função personalizada deve retornar array!",
                customfcheck: "A função personalizada deve estar presente em caso de verificação personalizada!"
            }
        },
        view: {
            caption: "Visualizar registro",
            bClose: "Fechar"
        },
        del: {
            caption: "Excluir",
            msg: "Excluir registro (s) selecionado (s)?",
            bSubmit: "Excluir",
            bCancel: "Cancelar"
        },
        nav: {
            edittext: "",
            edittitle: "Editar linha selecionada",
            addtext: "",
            addtitle: "Adicionar nova linha",
            deltext: "",
            deltitle: "Excluir linha selecionada",
            searchtext: "",
            searchtitle: "Encontrar registros",
            refreshtext: "",
            refreshtitle: "Recarregar grade",
            alertcap: "Aviso",
            alerttext: "Por favor, selecione a linha",
            viewtext: "",
            viewtitle: "Exibir linha selecionada",
            savetext: "",
            savetitle: "Salvar linha",
            canceltext: "",
            canceltitle: "Cancelar edição de linha",
            selectcaption: "Ações ..."
        },
        col: {
            caption: "Selecionar colunas",
            bSubmit: "Ok",
            bCancel: "Cancelar"
        },
        errors: {
            errcap: "Error",
            nourl: "Nenhum URL está definido",
            norecords: "Nenhum registro para processar",
            model: "Comprimento de colNames <> colModel!"
        },
        formatter: {
            integer: {
                thousandsSeparator: ",",
                defaultValue: "0"
            },
            number: {
                decimalSeparator: ".",
                thousandsSeparator: ",",
                decimalPlaces: 2,
                defaultValue: "0.00"
            },
            currency: {
                decimalSeparator: ".",
                thousandsSeparator: ",",
                decimalPlaces: 2,
                prefix: "",
                suffix: "",
                defaultValue: "0.00"
            },
            date: {
                dayNames: ["Seg", "Terç", "Qua", "Qui", "Sex", "Sáb", "Dom", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                AmPm: ["am", "pm", "AM", "PM"],
                S: function (a) {
                    return 11 > a || a > 13 ? ["st", "nd", "rd", "th"][Math.min((a - 1) % 10, 3)] : "th"
                },
                srcformat: "Y-m-d",
                newformat: "n/j/Y",
                parseRe: /[#%\\\/:_;.,\t\s-]/,
                masks: {
                    ISO8601Long: "Y-m-d H:i:s",
                    ISO8601Short: "Y-m-d",
                    ShortDate: "n/j/Y",
                    LongDate: "l, F d, Y",
                    FullDateTime: "l, F d, Y g:i:s A",
                    MonthDay: "F d",
                    ShortTime: "g:i A",
                    LongTime: "g:i:s A",
                    SortableDateTime: "Y-m-d\\TH:i:s",
                    UniversalSortableDateTime: "Y-m-d H:i:sO",
                    YearMonth: "F, Y"
                },
                reformatAfterEdit: !1,
                userLocalTime: !1
            },
            baseLinkUrl: "",
            showAction: "",
            target: "",
            checkbox: {
                disabled: !0
            },
            idName: "id"
        }
    }
});